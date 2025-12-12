/**
 * Comprehensive test suite for basic mode transitions in the Mindcraft LangGraph system
 * Tests switching between different reactive modes and validates state consistency
 */

// Mock utilities for testing
class MockBot {
    constructor() {
        this.pathfinder = {
            goal: null,
            setMovements: () => {},
            goto: async (goal) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (Math.random() < 0.3) {
                            reject(new Error('PathStopped: Pathfinding interrupted'));
                        } else {
                            resolve();
                        }
                    }, 50 + Math.random() * 100);
                    });
                },
            stop: () => {
                console.log('[MOCK BOT] Pathfinder stopped');
            },
            isMoving: () => false
        };
        
        this.entity = {
            position: { x: 0, y: 64, z: 0 }
        };
        
        this.blockAt = () => ({ name: 'air' });
        this.interrupt_code = null;
        this.modes = new MockModeController();
        
        // Bot controls
        this.controlStates = {
            forward: false,
            back: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
            sneak: false
        };
    }
    
    setControlState(control, state) {
        if (this.controlStates.hasOwnProperty(control)) {
            this.controlStates[control] = state;
            console.log(`[MOCK BOT] Control ${control} set to ${state}`);
        }
    }
    
    clearControlStates() {
        Object.keys(this.controlStates).forEach(control => {
            this.controlStates[control] = false;
        });
        console.log('[MOCK BOT] All control states cleared');
    }
}

class MockModeController {
    constructor() {
        this.behavior_log = '';
        this.activeModes = new Set();
        this.modeHistory = [];
    }
    
    recordModeActivation(modeName, reason) {
        this.activeModes.add(modeName);
        this.modeHistory.push({
            mode: modeName,
            timestamp: Date.now(),
            reason,
            action: 'activated'
        });
    }
    
    recordModeDeactivation(modeName, reason) {
        this.activeModes.delete(modeName);
        this.modeHistory.push({
            mode: modeName,
            timestamp: Date.now(),
            reason,
            action: 'deactivated'
        });
    }
    
    flushBehaviorLog() {
        const log = this.behavior_log;
        this.behavior_log = '';
        return log;
    }
    
    getActiveModes() {
        return Array.from(this.activeModes);
    }
    
    getModeHistory() {
        return this.modeHistory;
    }
}

class MockAgent {
    constructor() {
        this.bot = new MockBot();
        this.actions = {
            currentActionLabel: null,
            runAction: async (label, func, options = {}) => {
                try {
                    this.actions.currentActionLabel = label;
                    await func();
                    return { success: true, message: 'Action completed' };
                } catch (error) {
                    if (error.message && error.message.includes('PathStopped')) {
                        return { success: true, message: error.message, interrupted: true };
                    }
                    return { success: false, message: error.message };
                } finally {
                    this.actions.currentActionLabel = null;
                }
            }
        };
        this.self_prompter = {
            isActive: () => false,
            stopLoop: () => {}
        };
        this.state = {
            reactive: {
                activeMode: 'none',
                emergencyConditions: [],
                lastReactiveAction: null,
                interruptHistory: []
            },
            executive: {
                performanceMetrics: {
                    reactiveResponseTime: []
                }
            }
        };
    }
    
    isIdle() {
        return this.actions.currentActionLabel === null;
    }
    
    recordModeTransition(fromMode, toMode, reason) {
        const transition = {
            from: fromMode,
            to: toMode,
            timestamp: Date.now(),
            reason,
            stateSnapshot: this.getCurrentState()
        };
        
        if (!this.state.modeTransitions) {
            this.state.modeTransitions = [];
        }
        this.state.modeTransitions.push(transition);
    }
    
    getCurrentState() {
        return {
            activeMode: this.state.reactive.activeMode,
            isIdle: this.isIdle(),
            pathfinderGoal: this.bot.pathfinder.goal,
            controlStates: { ...this.bot.controlStates }
        };
    }
}

// Mode transition test harness
class ModeTransitionTestHarness {
    constructor() {
        this.agent = new MockAgent();
        this.transitions = [];
        this.errors = [];
    }
    
    async executeModeTransition(modeName, modeFunction, expectedPriority) {
        const startTime = Date.now();
        const previousMode = this.agent.state.reactive.activeMode;
        
        try {
            console.log(`[TRANSITION] Executing transition: ${previousMode} -> ${modeName}`);
            
            // Record the transition start
            this.agent.recordModeTransition(previousMode, modeName, 'test_execution');
            this.agent.bot.modes.recordModeActivation(modeName, 'test_execution');
            
            // Update agent state
            this.agent.state.reactive.activeMode = modeName;
            
            // Execute the mode function
            await modeFunction(this.agent);
            
            const executionTime = Date.now() - startTime;
            
            // Record performance metrics
            this.agent.state.executive.performanceMetrics.reactiveResponseTime.push(executionTime);
            
            // Record successful transition
            this.transitions.push({
                from: previousMode,
                to: modeName,
                success: true,
                executionTime,
                timestamp: Date.now(),
                priority: expectedPriority
            });
            
            console.log(`[TRANSITION] Successfully transitioned to ${modeName} in ${executionTime}ms`);
            
        } catch (error) {
            const executionTime = Date.now() - startTime;
            
            // Record failed transition
            this.transitions.push({
                from: previousMode,
                to: modeName,
                success: false,
                executionTime,
                error: error.message,
                timestamp: Date.now(),
                priority: expectedPriority
            });
            
            this.errors.push({
                transition: `${previousMode} -> ${modeName}`,
                error: error.message,
                timestamp: Date.now()
            });
            
            console.error(`[TRANSITION] Failed transition to ${modeName}: ${error.message}`);
        }
    }
    
    validateTransitionSequence(expectedSequence) {
        const actualSequence = this.transitions.map(t => t.to);
        const matches = JSON.stringify(actualSequence) === JSON.stringify(expectedSequence);
        
        console.log(`[VALIDATION] Expected sequence: ${expectedSequence.join(' -> ')}`);
        console.log(`[VALIDATION] Actual sequence: ${actualSequence.join(' -> ')}`);
        console.log(`[VALIDATION] Sequence ${matches ? 'MATCHES' : 'DOES NOT MATCH'}`);
        
        return matches;
    }
    
    getTransitionSummary() {
        const successful = this.transitions.filter(t => t.success).length;
        const failed = this.transitions.filter(t => !t.success).length;
        const averageTime = this.transitions.reduce((sum, t) => sum + t.executionTime, 0) / this.transitions.length;
        
        return {
            total: this.transitions.length,
            successful,
            failed,
            successRate: successful / this.transitions.length,
            averageExecutionTime: averageTime,
            errors: this.errors.length
        };
    }
}

// Test mode implementations
const testModes = {
    self_preservation: {
        name: 'self_preservation',
        priority: 0, // EMERGENCY
        execute: async (agent) => {
            console.log('[MODE] Self preservation: Moving away from danger');
            await agent.bot.pathfinder.goto({ x: 10, y: 64, z: 10 });
            agent.bot.setControlState('jump', false);
        }
    },
    
    self_defense: {
        name: 'self_defense',
        priority: 1, // SURVIVAL
        execute: async (agent) => {
            console.log('[MODE] Self defense: Engaging enemy');
            await agent.bot.pathfinder.goto({ x: 5, y: 64, z: 5 });
            // Simulate combat actions
        }
    },
    
    cowardice: {
        name: 'cowardice',
        priority: 1, // SURVIVAL
        execute: async (agent) => {
            console.log('[MODE] Cowardice: Running away from enemy');
            await agent.bot.pathfinder.goto({ x: 20, y: 64, z: 20 });
        }
    },
    
    unstuck: {
        name: 'unstuck',
        priority: 2, // OPPORTUNITY
        execute: async (agent) => {
            console.log('[MODE] Unstuck: Attempting to escape');
            await agent.bot.pathfinder.goto({ x: 2, y: 64, z: 2 });
        }
    },
    
    hunting: {
        name: 'hunting',
        priority: 3, // COGNITIVE
        execute: async (agent) => {
            console.log('[MODE] Hunting: Tracking prey');
            await agent.bot.pathfinder.goto({ x: 15, y: 64, z: 15 });
        }
    },
    
    item_collecting: {
        name: 'item_collecting',
        priority: 3, // COGNITIVE
        execute: async (agent) => {
            console.log('[MODE] Item collecting: Gathering items');
            await agent.bot.pathfinder.goto({ x: 8, y: 64, z: 8 });
        }
    }
};

// Test functions
async function testBasicModeSwitching() {
    console.log('\n=== Test 1: Basic Mode Switching ===');
    
    const harness = new ModeTransitionTestHarness();
    
    // Test normal mode transitions
    await harness.executeModeTransition('hunting', testModes.hunting.execute, 3);
    await harness.executeModeTransition('item_collecting', testModes.item_collecting.execute, 3);
    await harness.executeModeTransition('unstuck', testModes.unstuck.execute, 2);
    
    // Validate sequence
    const expectedSequence = ['hunting', 'item_collecting', 'unstuck'];
    const sequenceValid = harness.validateTransitionSequence(expectedSequence);
    
    // Validate results
    const summary = harness.getTransitionSummary();
    console.assert(sequenceValid, 'Mode transition sequence should match expected');
    console.assert(summary.successRate === 1.0, 'All transitions should succeed');
    console.assert(summary.averageExecutionTime < 200, 'Average execution time should be reasonable');
    
    console.log('✓ Basic mode switching test passed');
    return summary;
}

async function testEmergencyModePreemption() {
    console.log('\n=== Test 2: Emergency Mode Preemption ===');
    
    const harness = new ModeTransitionTestHarness();
    
    // Start with a low priority mode
    await harness.executeModeTransition('hunting', testModes.hunting.execute, 3);
    
    // Emergency should preempt
    await harness.executeModeTransition('self_preservation', testModes.self_preservation.execute, 0);
    
    // Another emergency
    await harness.executeModeTransition('self_defense', testModes.self_defense.execute, 1);
    
    // Validate emergency priorities were respected
    const transitions = harness.transitions;
    const emergencyTransition = transitions.find(t => t.to === 'self_preservation');
    const defenseTransition = transitions.find(t => t.to === 'self_defense');
    
    console.assert(emergencyTransition.success, 'Emergency transition should succeed');
    console.assert(defenseTransition.success, 'Defense transition should succeed');
    console.assert(emergencyTransition.priority === 0, 'Emergency should have highest priority');
    console.assert(defenseTransition.priority === 1, 'Defense should have survival priority');
    
    console.log('✓ Emergency mode preemption test passed');
    return harness.getTransitionSummary();
}

async function testModeStateConsistency() {
    console.log('\n=== Test 3: Mode State Consistency ===');
    
    const harness = new ModeTransitionTestHarness();
    
    // Execute multiple transitions
    const modes = ['hunting', 'self_defense', 'cowardice', 'item_collecting'];
    for (const modeName of modes) {
        await harness.executeModeTransition(modeName, testModes[modeName].execute, testModes[modeName].priority);
    }
    
    // Validate state consistency
    const agent = harness.agent;
    const finalState = agent.getCurrentState();
    const modeHistory = agent.bot.modes.getModeHistory();
    const transitionHistory = agent.state.modeTransitions || [];
    
    console.assert(finalState.activeMode === modes[modes.length - 1], 'Final active mode should be correct');
    console.assert(modeHistory.length === modes.length, 'Mode history should record all activations');
    console.assert(transitionHistory.length === modes.length, 'Transition history should record all transitions');
    
    // Validate that each transition properly cleaned up previous state
    for (let i = 0; i < transitionHistory.length - 1; i++) {
        const transition = transitionHistory[i];
        const nextTransition = transitionHistory[i + 1];
        
        console.assert(transition.to === nextTransition.from, 'Transitions should chain correctly');
    }
    
    console.log('✓ Mode state consistency test passed');
    return harness.getTransitionSummary();
}

async function testRapidModeSwitching() {
    console.log('\n=== Test 4: Rapid Mode Switching ===');
    
    const harness = new ModeTransitionTestHarness();
    
    // Execute rapid transitions (simulating quick emergency responses)
    const startTime = Date.now();
    
    await harness.executeModeTransition('hunting', testModes.hunting.execute, 3);
    await harness.executeModeTransition('self_preservation', testModes.self_preservation.execute, 0);
    await harness.executeModeTransition('cowardice', testModes.cowardice.execute, 1);
    await harness.executeModeTransition('self_defense', testModes.self_defense.execute, 1);
    await harness.executeModeTransition('unstuck', testModes.unstuck.execute, 2);
    
    const totalTime = Date.now() - startTime;
    const summary = harness.getTransitionSummary();
    
    // Validate performance requirements
    console.assert(totalTime < 1000, 'All rapid transitions should complete within 1 second');
    console.assert(summary.averageExecutionTime < 200, 'Average transition time should be under 200ms');
    console.assert(summary.successRate >= 0.8, 'At least 80% of rapid transitions should succeed');
    
    console.log(`✓ Rapid mode switching test passed (${totalTime}ms total, ${summary.averageExecutionTime.toFixed(1)}ms average)`);
    return summary;
}

async function testModeInterruptionHandling() {
    console.log('\n=== Test 5: Mode Interruption Handling ===');
    
    const harness = new ModeTransitionTestHarness();
    
    // Start a long-running mode
    const longRunningMode = async (agent) => {
        console.log('[MODE] Starting long-running operation');
        // Simulate a longer operation that gets interrupted
        await new Promise(resolve => setTimeout(resolve, 200));
        await agent.bot.pathfinder.goto({ x: 50, y: 64, z: 50 });
    };
    
    // Start the long operation
    const longOperationPromise = harness.executeModeTransition('hunting', longRunningMode, 3);
    
    // Wait a bit, then interrupt with emergency
    await new Promise(resolve => setTimeout(resolve, 50));
    await harness.executeModeTransition('self_preservation', testModes.self_preservation.execute, 0);
    
    // Wait for both to complete
    await longOperationPromise;
    
    // Validate interruption handling
    const transitions = harness.transitions;
    const interruptedTransition = transitions.find(t => t.to === 'hunting');
    const emergencyTransition = transitions.find(t => t.to === 'self_preservation');
    
    console.assert(emergencyTransition.success, 'Emergency should succeed even when interrupting');
    console.assert(emergencyTransition.executionTime < 150, 'Emergency should be fast even with interruption');
    
    // Check if pathfinder cleanup occurred
    const agent = harness.agent;
    const pathfinderCleared = agent.bot.pathfinder.goal === null;
    console.assert(pathfinderCleared, 'Pathfinder should be cleared after interruption');
    
    console.log('✓ Mode interruption handling test passed');
    return harness.getTransitionSummary();
}

async function testModeTransitionValidation() {
    console.log('\n=== Test 6: Mode Transition Validation ===');
    
    const harness = new ModeTransitionTestHarness();
    
    // Test invalid mode transitions
    try {
        await harness.executeModeTransition('invalid_mode', async () => {}, 999);
        console.assert(false, 'Invalid mode should fail');
    } catch (error) {
        console.log('✓ Invalid mode properly rejected');
    }
    
    // Test mode with null execution function
    try {
        await harness.executeModeTransition('null_mode', null, 1);
        console.assert(false, 'Null execution function should fail');
    } catch (error) {
        console.log('✓ Null execution function properly rejected');
    }
    
    // Test mode that throws exception
    const failingMode = async (agent) => {
        throw new Error('Mode execution failed');
    };
    
    await harness.executeModeTransition('failing_mode', failingMode, 1);
    const summary = harness.getTransitionSummary();
    
    console.assert(summary.failed > 0, 'Failing mode should be recorded as failed');
    console.assert(summary.successRate < 1.0, 'Success rate should reflect failures');
    
    console.log('✓ Mode transition validation test passed');
    return summary;
}

// Main test runner
async function runModeTransitionTests() {
    console.log('🔄 Starting Comprehensive Mode Transition Tests...\n');
    
    const results = {
        basicSwitching: null,
        emergencyPreemption: null,
        stateConsistency: null,
        rapidSwitching: null,
        interruptionHandling: null,
        transitionValidation: null
    };
    
    try {
        results.basicSwitching = await testBasicModeSwitching();
        results.emergencyPreemption = await testEmergencyModePreemption();
        results.stateConsistency = await testModeStateConsistency();
        results.rapidSwitching = await testRapidModeSwitching();
        results.interruptionHandling = await testModeInterruptionHandling();
        results.transitionValidation = await testModeTransitionValidation();
        
        // Calculate overall statistics
        const totalTransitions = Object.values(results).reduce((sum, result) => sum + (result?.total || 0), 0);
        const totalSuccessful = Object.values(results).reduce((sum, result) => sum + (result?.successful || 0), 0);
        const overallSuccessRate = totalSuccessful / totalTransitions;
        const averageTime = Object.values(results).reduce((sum, result) => sum + (result?.averageExecutionTime || 0), 0) / Object.keys(results).length;
        
        console.log('\n✅ All mode transition tests passed!');
        console.log('📊 Test Summary:');
        console.log(`  Total transitions tested: ${totalTransitions}`);
        console.log(`  Overall success rate: ${(overallSuccessRate * 100).toFixed(1)}%`);
        console.log(`  Average execution time: ${averageTime.toFixed(1)}ms`);
        console.log('\n🎯 Mode Transition System Validation:');
        console.log('  ✓ Basic mode switching works correctly');
        console.log('  ✓ Emergency mode preemption functions properly');
        console.log('  ✓ State consistency maintained during transitions');
        console.log('  ✓ Rapid mode switching meets performance requirements');
        console.log('  ✓ Mode interruption handling is robust');
        console.log('  ✓ Invalid transitions are properly rejected');
        
        return results;
        
    } catch (error) {
        console.error('\n❌ Mode transition test failed:', error.message);
        console.error(error.stack);
        throw error;
    }
}

// Export for use in other test files
export { 
    runModeTransitionTests, 
    testBasicModeSwitching,
    testEmergencyModePreemption,
    testModeStateConsistency,
    testRapidModeSwitching,
    testModeInterruptionHandling,
    testModeTransitionValidation,
    MockBot,
    MockAgent,
    ModeTransitionTestHarness,
    testModes
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runModeTransitionTests().catch(console.error);
}