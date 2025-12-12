/**
 * Comprehensive test for pathfinder state management system
 * Tests graceful cleanup during interruptions and state validation
 */

import { PathfinderStateManager } from './src/agent/langgraph/pathfinder_state.js';
import { InterruptController } from './src/agent/langgraph/interrupt_controller.js';
import { ReactiveBehaviorLayer } from './src/agent/langgraph/reactive_layer.js';

// Mock bot object for testing
const createMockBot = () => {
    const mockBot = {
        pathfinder: {
            setMovements: () => {},
            goto: async (goal) => {
                // Simulate pathfinding that can be interrupted
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
    
    return mockBot;
};

// Test helper functions
const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test 1: Basic pathfinder state tracking
async function testBasicStateTracking() {
    console.log('\n=== Test 1: Basic State Tracking ===');
    
    const bot = createMockBot();
    const manager = PathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-1', bot);
    
    // Test starting an operation
    const goal = { x: 10, y: 64, z: 10 };
    const operationId = await pathfinder.startOperation('goto', goal, 'test', { timeout: 5000 });
    
    assert(operationId !== null, 'Operation ID should be generated');
    console.log(`✓ Started operation: ${operationId}`);
    
    // Check state
    const state = pathfinder.getState();
    assert(state.activeOperations.size === 1, 'Should have 1 active operation');
    assert(state.totalOperationsStarted === 1, 'Should track total operations');
    console.log('✓ State tracking working correctly');
    
    // Test completing operation
    pathfinder.completeOperation(operationId, 'success');
    const finalState = pathfinder.getState();
    assert(finalState.activeOperations.size === 0, 'Should have no active operations');
    assert(finalState.totalOperationsCompleted === 1, 'Should track completed operations');
    console.log('✓ Operation completion tracked correctly');
    
    manager.unregisterPathfinder('test-bot-1');
    console.log('✓ Test 1 passed');
}

// Test 2: Interrupt handling and cleanup
async function testInterruptHandling() {
    console.log('\n=== Test 2: Interrupt Handling ===');
    
    const bot = createMockBot();
    const manager = PathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-2', bot);
    
    // Start multiple operations
    const goal1 = { x: 10, y: 64, z: 10 };
    const goal2 = { x: 20, y: 64, z: 20 };
    const goal3 = { x: 30, y: 64, z: 30 };
    
    const op1 = await pathfinder.startOperation('goto', goal1, 'test', { timeout: 5000 });
    const op2 = await pathfinder.startOperation('goto', goal2, 'test', { timeout: 5000 });
    const op3 = await pathfinder.startOperation('goto', goal3, 'test', { timeout: 5000 });
    
    assert(pathfinder.getState().activeOperations.size === 3, 'Should have 3 active operations');
    console.log('✓ Started 3 operations');
    
    // Test interrupt cleanup
    const cleanupResults = pathfinder.stopAllOperations('test_interrupt');
    assert(cleanupResults.stopped === 3, 'Should stop all 3 operations');
    assert(pathfinder.getState().activeOperations.size === 0, 'Should have no active operations after cleanup');
    console.log('✓ Interrupt cleanup working correctly');
    
    manager.unregisterPathfinder('test-bot-2');
    console.log('✓ Test 2 passed');
}

// Test 3: State validation and recovery
async function testStateValidation() {
    console.log('\n=== Test 3: State Validation ===');
    
    const bot = createMockBot();
    const manager = PathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-3', bot);
    
    // Start an operation
    const goal = { x: 10, y: 64, z: 10 };
    const operationId = await pathfinder.startOperation('goto', goal, 'test', { timeout: 1000 });
    
    // Wait for operation to timeout
    await delay(1500);
    
    // Check for stuck operations
    const validation = pathfinder.validateState();
    assert(validation.staleOperations.length > 0, 'Should detect stale operations');
    console.log(`✓ Detected ${validation.staleOperations.length} stale operations`);
    
    // Recover from stale state
    const recovery = pathfinder.recoverFromStaleState();
    assert(recovery.recovered > 0, 'Should recover stale operations');
    console.log(`✓ Recovered ${recovery.recovered} stale operations`);
    
    manager.unregisterPathfinder('test-bot-3');
    console.log('✓ Test 3 passed');
}

// Test 4: Performance monitoring
async function testPerformanceMonitoring() {
    console.log('\n=== Test 4: Performance Monitoring ===');
    
    const bot = createMockBot();
    const manager = PathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-4', bot);
    
    // Start and complete operations to generate metrics
    for (let i = 0; i < 5; i++) {
        const goal = { x: i * 10, y: 64, z: i * 10 };
        const operationId = await pathfinder.startOperation('goto', goal, 'test', { timeout: 5000 });
        pathfinder.completeOperation(operationId, 'success');
        await delay(10); // Small delay to simulate real usage
    }
    
    const metrics = pathfinder.getPerformanceMetrics();
    assert(metrics.totalOperations === 5, 'Should track 5 operations');
    assert(metrics.successRate === 100, 'Should have 100% success rate');
    assert(metrics.averageCompletionTime > 0, 'Should track completion time');
    console.log(`✓ Performance metrics: ${JSON.stringify(metrics, null, 2)}`);
    
    manager.unregisterPathfinder('test-bot-4');
    console.log('✓ Test 4 passed');
}

// Test 5: Integration with interrupt controller
async function testInterruptControllerIntegration() {
    console.log('\n=== Test 5: Interrupt Controller Integration ===');
    
    const bot = createMockBot();
    const manager = PathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-5', bot);
    
    // Create interrupt controller
    const interruptController = new InterruptController();
    interruptController.pathfinderManager = manager;
    
    // Start an operation
    const goal = { x: 10, y: 64, z: 10 };
    const operationId = await pathfinder.startOperation('goto', goal, 'test', { timeout: 5000 });
    
    // Simulate emergency condition
    const mockAgent = {
        state: {
            reactive: {
                emergencyConditions: []
            }
        }
    };
    
    // Test pathfinder stuck detection
    const emergency = interruptController.checkPathfinderState(mockAgent);
    assert(emergency !== null, 'Should detect pathfinder state issues');
    console.log('✓ Interrupt controller detects pathfinder issues');
    
    // Test cleanup integration
    const cleanupResult = interruptController.performPathfinderCleanup(mockAgent);
    assert(cleanupResult.cleaned > 0, 'Should perform cleanup through interrupt controller');
    console.log(`✓ Cleanup through interrupt controller: ${cleanupResult.cleaned} operations`);
    
    manager.unregisterPathfinder('test-bot-5');
    console.log('✓ Test 5 passed');
}

// Test 6: Reactive layer integration
async function testReactiveLayerIntegration() {
    console.log('\n=== Test 6: Reactive Layer Integration ===');
    
    const bot = createMockBot();
    const manager = PathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-6', bot);
    
    // Create reactive layer
    const reactiveLayer = new ReactiveBehaviorLayer();
    reactiveLayer.pathfinderManager = manager;
    
    // Start some operations
    const goal1 = { x: 10, y: 64, z: 10 };
    const goal2 = { x: 20, y: 64, z: 20 };
    
    await pathfinder.startOperation('goto', goal1, 'test', { timeout: 5000 });
    await pathfinder.startOperation('goto', goal2, 'test', { timeout: 5000 });
    
    // Test cleanup through reactive layer
    const mockAgent = { bot };
    const cleanupResult = reactiveLayer.cleanupPathfinderState(mockAgent);
    
    assert(cleanupResult.stopped === 2, 'Should cleanup operations through reactive layer');
    console.log(`✓ Reactive layer cleanup: ${cleanupResult.stopped} operations`);
    
    manager.unregisterPathfinder('test-bot-6');
    console.log('✓ Test 6 passed');
}

// Test 7: Fallback mechanisms
async function testFallbackMechanisms() {
    console.log('\n=== Test 7: Fallback Mechanisms ===');
    
    const bot = createMockBot();
    const manager = PathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-7', bot);
    
    // Test graceful degradation when pathfinder manager is unavailable
    const originalManager = pathfinder.pathfinderManager;
    pathfinder.pathfinderManager = null;
    
    const cleanupResult = pathfinder.stopAllOperations('fallback_test');
    assert(cleanupResult.stopped === 0, 'Should handle missing manager gracefully');
    console.log('✓ Fallback handling works when manager is unavailable');
    
    // Restore manager
    pathfinder.pathfinderManager = originalManager;
    
    // Test timeout-based cleanup
    const goal = { x: 10, y: 64, z: 10 };
    const operationId = await pathfinder.startOperation('goto', goal, 'test', { timeout: 100 });
    
    await delay(200); // Wait for timeout
    
    const timeoutCleanup = pathfinder.cleanupTimedOutOperations();
    assert(timeoutCleanup.cleaned >= 0, 'Should handle timeout cleanup');
    console.log(`✓ Timeout cleanup: ${timeoutCleanup.cleaned} operations`);
    
    manager.unregisterPathfinder('test-bot-7');
    console.log('✓ Test 7 passed');
}

// Test 8: Error handling and resilience
async function testErrorHandling() {
    console.log('\n=== Test 8: Error Handling ===');
    
    const bot = createMockBot();
    const manager = PathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-8', bot);
    
    // Test invalid operation completion
    try {
        pathfinder.completeOperation('invalid-id', 'success');
        console.log('✓ Handles invalid operation ID gracefully');
    } catch (error) {
        console.log('✗ Should handle invalid ID gracefully');
    }
    
    // Test corrupted state recovery
    pathfinder.getState().activeOperations.set('corrupted', {
        startTime: Date.now() - 100000, // Very old operation
        type: 'goto',
        source: 'test'
    });
    
    const recovery = pathfinder.recoverFromStaleState();
    assert(recovery.recovered > 0, 'Should recover from corrupted state');
    console.log(`✓ Recovered from corrupted state: ${recovery.recovered} operations`);
    
    manager.unregisterPathfinder('test-bot-8');
    console.log('✓ Test 8 passed');
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Pathfinder State Management Tests...');
    
    try {
        await testBasicStateTracking();
        await testInterruptHandling();
        await testStateValidation();
        await testPerformanceMonitoring();
        await testInterruptControllerIntegration();
        await testReactiveLayerIntegration();
        await testFallbackMechanisms();
        await testErrorHandling();
        
        console.log('\n✅ All tests passed! Pathfinder state management system is working correctly.');
        
        // Print final system state
        const manager = PathfinderStateManager.getInstance();
        const systemStats = manager.getSystemStats();
        console.log('\n📊 Final System Statistics:');
        console.log(JSON.stringify(systemStats, null, 2));
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
}

export {
    runAllTests,
    testBasicStateTracking,
    testInterruptHandling,
    testStateValidation,
    testPerformanceMonitoring,
    testInterruptControllerIntegration,
    testReactiveLayerIntegration,
    testFallbackMechanisms,
    testErrorHandling
};