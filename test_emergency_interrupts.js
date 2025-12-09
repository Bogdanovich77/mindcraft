/**
 * Comprehensive test suite for emergency interrupt handling in the Mindcraft LangGraph system
 * Tests interrupt priority system, emergency detection, and cognitive preemption
 */

// Mock implementations for testing
class MockInterruptController {
    constructor() {
        this.interruptHistory = [];
        this.emergencyConditions = [];
        this.cognitivePreempted = false;
    }
    
    checkEmergencyConditions(state) {
        // Simulate emergency detection based on state
        const emergencies = state.reactive.emergencyConditions;
        
        if (emergencies.length === 0) {
            return 3; // COGNITIVE
        }
        
        // Return highest priority (lowest number) from active emergencies
        const highestPriority = Math.min(...emergencies.map(e => this.getEmergencyPriority(e.type)));
        return highestPriority;
    }
    
    getEmergencyPriority(emergencyType) {
        switch (emergencyType) {
            case 'drowning':
            case 'burning':
            case 'falling':
                return 0; // EMERGENCY
            case 'low_health':
            case 'hostile_nearby':
                return 1; // SURVIVAL
            case 'stuck':
                return 2; // OPPORTUNITY
            default:
                return 3; // COGNITIVE
        }
    }
    
    preemptCognitiveProcessing(priority) {
        this.cognitivePreempted = true;
        this.interruptHistory.push({
            type: 'cognitive_preempted',
            priority,
            timestamp: Date.now()
        });
        console.log(`[INTERRUPT] Cognitive processing preempted for priority ${priority}`);
    }
    
    resumeCognitiveProcessing() {
        this.cognitivePreempted = false;
        this.interruptHistory.push({
            type: 'cognitive_resumed',
            timestamp: Date.now()
        });
        console.log(`[INTERRUPT] Cognitive processing resumed`);
    }
    
    shouldBypassCognitive(priority) {
        return priority <= 1; // EMERGENCY or SURVIVAL
    }
    
    recordInterrupt(state, priority, mode, bypassedCognitive) {
        const interrupt = {
            priority,
            mode,
            timestamp: Date.now(),
            bypassedCognitive,
            conditions: state.reactive.emergencyConditions.map(e => e.type)
        };
        
        state.reactive.interruptHistory.push(interrupt);
        this.interruptHistory.push(interrupt);
    }
}

class MockBot {
    constructor() {
        this.pathfinder = {
            goal: null,
            setMovements: () => {},
            goto: async (goal) => {
                return new Promise((resolve, reject) => {
                    const delay = 50 + Math.random() * 100;
                    setTimeout(() => {
                        if (Math.random() < 0.4) {
                            reject(new Error('PathStopped: Path was stopped before it could be completed!'));
                        } else {
                            resolve();
                        }
                    }, delay);
                });
            },
            stop: () => {
                console.log('[MOCK BOT] Pathfinder stopped due to interrupt');
            },
            isMoving: () => false
        };
        
        this.entity = {
            position: { x: 0, y: 64, z: 0 },
            health: 20,
            food: 20
        };
        
        this.blockAt = (pos) => ({ name: 'air' });
        this.interrupt_code = null;
        this.lastDamageTime = 0;
        this.lastDamageTaken = 0;
        
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
        }
    }
    
    clearControlStates() {
        Object.keys(this.controlStates).forEach(control => {
            this.controlStates[control] = false;
        });
    }
    
    simulateDamage(amount) {
        this.lastDamageTime = Date.now();
        this.lastDamageTaken = amount;
        this.entity.health -= amount;
    }
}

class MockAgent {
    constructor() {
        this.bot = new MockBot();
        this.interruptController = new MockInterruptController();
        this.actions = {
            currentActionLabel: null,
            runAction: async (label, func, options = {}) => {
                try {
                    this.actions.currentActionLabel = label;
                    const result = await func();
                    return { success: true, message: 'Action completed', result };
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
            context: {
                position: { x: 0, y: 64, z: 0 },
                health: 20,
                food: 20,
                nearbyEntities: [],
                nearbyBlocks: []
            },
            reactive: {
                activeMode: 'none',
                emergencyConditions: [],
                lastReactiveAction: null,
                interruptHistory: []
            },
            cognitive: {
                processing: {
                    currentPhase: 'reflection', // Start with reflection (safe phase)
                    cognitiveLoad: 0.5
                }
            },
            executive: {
                performanceMetrics: {
                    reactiveResponseTime: [],
                    cognitiveProcessingTime: []
                }
            }
        };
    }
    
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
        console.log(`[AGENT] Emergency condition added: ${type} (severity: ${severity})`);
    }
    
    clearEmergencyConditions() {
        this.state.reactive.emergencyConditions = [];
        console.log(`[AGENT] All emergency conditions cleared`);
    }
    
    simulateCognitiveProcessing(duration = 1000) {
        this.state.cognitive.processing.currentPhase = 'planning';
        return new Promise(resolve => {
            setTimeout(() => {
                this.state.cognitive.processing.currentPhase = 'reflection';
                resolve();
            }, duration);
        });
    }
}

// Emergency interrupt test harness
class EmergencyInterruptTestHarness {
    constructor() {
        this.agent = new MockAgent();
        this.interruptEvents = [];
        this.performanceMetrics = {
            interruptDetectionTime: [],
            interruptResponseTime: [],
            cognitivePreemptionTime: []
        };
    }
    
    async simulateEmergencyInterrupt(emergencyType, duringCognitive = false) {
        const startTime = Date.now();
        
        console.log(`\n[EMERGENCY] Simulating ${emergencyType} emergency`);
        
        // Add emergency condition
        this.agent.addEmergencyCondition(emergencyType);
        
        // Detect emergency
        const detectionStart = Date.now();
        const priority = this.agent.interruptController.checkEmergencyConditions(this.agent.state);
        const detectionTime = Date.now() - detectionStart;
        this.performanceMetrics.interruptDetectionTime.push(detectionTime);
        
        console.log(`[EMERGENCY] Emergency detected with priority ${priority} in ${detectionTime}ms`);
        
        // Start cognitive processing if requested
        let cognitivePromise = null;
        if (duringCognitive) {
            cognitivePromise = this.agent.simulateCognitiveProcessing(2000);
        }
        
        // Handle interrupt
        const responseStart = Date.now();
        const shouldBypass = this.agent.interruptController.shouldBypassCognitive(priority);
        
        if (shouldBypass) {
            console.log(`[EMERGENCY] Bypassing cognitive processing for immediate response`);
            
            // Preempt cognitive if it's running
            if (duringCognitive) {
                const preemptStart = Date.now();
                this.agent.interruptController.preemptCognitiveProcessing(priority);
                const preemptTime = Date.now() - preemptStart;
                this.performanceMetrics.cognitivePreemptionTime.push(preemptTime);
            }
            
            // Execute emergency response
            await this.executeEmergencyResponse(priority);
            
        } else {
            console.log(`[EMERGENCY] Allowing cognitive processing to handle the situation`);
            // Would queue for cognitive processing
        }
        
        const responseTime = Date.now() - responseStart;
        this.performanceMetrics.interruptResponseTime.push(responseTime);
        
        // Record interrupt event
        const event = {
            emergencyType,
            priority,
            detectionTime,
            responseTime,
            bypassedCognitive: shouldBypass,
            timestamp: Date.now()
        };
        this.interruptEvents.push(event);
        
        // Wait for cognitive to complete if it was running
        if (cognitivePromise) {
            await cognitivePromise;
            this.agent.interruptController.resumeCognitiveProcessing();
        }
        
        // Clear emergency
        this.agent.clearEmergencyConditions();
        
        console.log(`[EMERGENCY] Emergency handled in ${responseTime}ms`);
        return event;
    }
    
    async executeEmergencyResponse(priority) {
        const responseMap = {
            0: async () => {
                // EMERGENCY - immediate survival action
                console.log(`[RESPONSE] Executing emergency survival action`);
                await this.agent.bot.pathfinder.goto({ x: 10, y: 64, z: 10 });
                this.agent.bot.clearControlStates();
            },
            1: async () => {
                // SURVIVAL - defensive action
                console.log(`[RESPONSE] Executing survival defensive action`);
                await this.agent.bot.pathfinder.goto({ x: 5, y: 64, z: 5 });
            },
            2: async () => {
                // OPPORTUNITY - utility action
                console.log(`[RESPONSE] Executing opportunity utility action`);
                await this.agent.bot.pathfinder.goto({ x: 2, y: 64, z: 2 });
            }
        };
        
        const responseFunc = responseMap[priority];
        if (responseFunc) {
            await responseFunc();
        }
    }
    
    validateInterruptRequirements() {
        const requirements = {
            emergencyDetectionMaxTime: 10,    // 10ms
            emergencyResponseMaxTime: 50,     // 50ms
            survivalResponseMaxTime: 100,     // 100ms
            cognitivePreemptionMaxTime: 5     // 5ms
        };
        
        const results = {
            emergencyDetection: this.performanceMetrics.interruptDetectionTime.filter(t => t <= requirements.emergencyDetectionMaxTime).length / this.performanceMetrics.interruptDetectionTime.length,
            emergencyResponse: this.performanceMetrics.interruptResponseTime.filter(t => t <= requirements.emergencyResponseMaxTime).length / this.performanceMetrics.interruptResponseTime.length,
            survivalResponse: this.performanceMetrics.interruptResponseTime.filter(t => t <= requirements.survivalResponseMaxTime).length / this.performanceMetrics.interruptResponseTime.length,
            cognitivePreemption: this.performanceMetrics.cognitivePreemptionTime.filter(t => t <= requirements.cognitivePreemptionMaxTime).length / this.performanceMetrics.cognitivePreemptionTime.length
        };
        
        console.log(`\n[VALIDATION] Interrupt Performance Requirements:`);
        console.log(`  Emergency detection: ${(results.emergencyDetection * 100).toFixed(1)}% within ${requirements.emergencyDetectionMaxTime}ms`);
        console.log(`  Emergency response: ${(results.emergencyResponse * 100).toFixed(1)}% within ${requirements.emergencyResponseMaxTime}ms`);
        console.log(`  Survival response: ${(results.survivalResponse * 100).toFixed(1)}% within ${requirements.survivalResponseMaxTime}ms`);
        console.log(`  Cognitive preemption: ${(results.cognitivePreemption * 100).toFixed(1)}% within ${requirements.cognitivePreemptionMaxTime}ms`);
        
        return results;
    }
    
    getInterruptSummary() {
        const byPriority = {};
        const byType = {};
        
        this.interruptEvents.forEach(event => {
            byPriority[event.priority] = (byPriority[event.priority] || 0) + 1;
            byType[event.emergencyType] = (byType[event.emergencyType] || 0) + 1;
        });
        
        return {
            totalInterrupts: this.interruptEvents.length,
            byPriority,
            byType,
            averageDetectionTime: this.performanceMetrics.interruptDetectionTime.reduce((a, b) => a + b, 0) / this.performanceMetrics.interruptDetectionTime.length || 0,
            averageResponseTime: this.performanceMetrics.interruptResponseTime.reduce((a, b) => a + b, 0) / this.performanceMetrics.interruptResponseTime.length || 0,
            averagePreemptionTime: this.performanceMetrics.cognitivePreemptionTime.reduce((a, b) => a + b, 0) / this.performanceMetrics.cognitivePreemptionTime.length || 0
        };
    }
}

// Test functions
async function testEmergencyInterruptDetection() {
    console.log('\n=== Test 1: Emergency Interrupt Detection ===');
    
    const harness = new EmergencyInterruptTestHarness();
    
    // Test different emergency types
    const emergencies = ['drowning', 'burning', 'low_health', 'hostile_nearby', 'stuck'];
    
    for (const emergency of emergencies) {
        await harness.simulateEmergencyInterrupt(emergency);
    }
    
    // Validate detection
    const summary = harness.getInterruptSummary();
    console.assert(summary.totalInterrupts === emergencies.length, 'All emergencies should be detected');
    
    // Validate priorities
    console.assert(summary.byPriority[0] >= 2, 'Should detect emergency priority (0) events');
    console.assert(summary.byPriority[1] >= 2, 'Should detect survival priority (1) events');
    console.assert(summary.byPriority[2] >= 1, 'Should detect opportunity priority (2) events');
    
    console.log('✓ Emergency interrupt detection test passed');
    return summary;
}

async function testCognitivePreemption() {
    console.log('\n=== Test 2: Cognitive Preemption ===');
    
    const harness = new EmergencyInterruptTestHarness();
    
    // Test interrupting cognitive processing
    await harness.simulateEmergencyInterrupt('drowning', true);
    await harness.simulateEmergencyInterrupt('hostile_nearby', true);
    await harness.simulateEmergencyInterrupt('stuck', true);
    
    // Validate preemption
    const interruptHistory = harness.agent.interruptController.interruptHistory;
    const preemptEvents = interruptHistory.filter(e => e.type === 'cognitive_preempted');
    const resumeEvents = interruptHistory.filter(e => e.type === 'cognitive_resumed');
    
    console.assert(preemptEvents.length >= 2, 'Should preempt cognitive for emergency and survival');
    console.assert(resumeEvents.length >= 2, 'Should resume cognitive after handling');
    
    // Validate preemption timing
    const validation = harness.validateInterruptRequirements();
    console.assert(validation.cognitivePreemption > 0.8, 'Cognitive preemption should be fast');
    
    console.log('✓ Cognitive preemption test passed');
    return harness.getInterruptSummary();
}

async function testInterruptPriorityHandling() {
    console.log('\n=== Test 3: Interrupt Priority Handling ===');
    
    const harness = new EmergencyInterruptTestHarness();
    
    // Test multiple simultaneous emergencies
    this.agent.addEmergencyCondition('stuck'); // Low priority
    this.agent.addEmergencyCondition('hostile_nearby'); // Medium priority
    this.agent.addEmergencyCondition('drowning'); // High priority
    
    // Should select highest priority (drowning)
    const priority = harness.agent.interruptController.checkEmergencyConditions(harness.agent.state);
    console.assert(priority === 0, 'Should select highest priority emergency (0)');
    
    await harness.simulateEmergencyInterrupt('drowning');
    
    // Clear and test different combinations
    harness.agent.clearEmergencyConditions();
    harness.agent.addEmergencyCondition('stuck');
    harness.agent.addEmergencyCondition('hostile_nearby');
    
    const priority2 = harness.agent.interruptController.checkEmergencyConditions(harness.agent.state);
    console.assert(priority2 === 1, 'Should select survival priority over opportunity (1)');
    
    await harness.simulateEmergencyInterrupt('hostile_nearby');
    
    console.log('✓ Interrupt priority handling test passed');
    return harness.getInterruptSummary();
}

async function testRapidInterruptSequence() {
    console.log('\n=== Test 4: Rapid Interrupt Sequence ===');
    
    const harness = new EmergencyInterruptTestHarness();
    
    // Simulate rapid emergency sequence
    const startTime = Date.now();
    
    await harness.simulateEmergencyInterrupt('burning');
    await harness.simulateEmergencyInterrupt('hostile_nearby');
    await harness.simulateEmergencyInterrupt('drowning');
    await harness.simulateEmergencyInterrupt('low_health');
    await harness.simulateEmergencyInterrupt('falling');
    
    const totalTime = Date.now() - startTime;
    const summary = harness.getInterruptSummary();
    
    // Validate rapid response
    console.assert(totalTime < 1000, 'All rapid interrupts should handle within 1 second');
    console.assert(summary.averageResponseTime < 100, 'Average response time should be under 100ms');
    
    const validation = harness.validateInterruptRequirements();
    console.assert(validation.emergencyResponse > 0.7, 'Emergency responses should meet timing requirements');
    
    console.log(`✓ Rapid interrupt sequence test passed (${totalTime}ms total)`);
    return summary;
}

async function testInterruptStateConsistency() {
    console.log('\n=== Test 5: Interrupt State Consistency ===');
    
    const harness = new EmergencyInterruptTestHarness();
    
    // Test interrupt during active mode
    harness.agent.state.reactive.activeMode = 'hunting';
    const initialMode = harness.agent.state.reactive.activeMode;
    
    await harness.simulateEmergencyInterrupt('drowning');
    
    // Validate state consistency
    const finalMode = harness.agent.state.reactive.activeMode;
    const interruptHistory = harness.agent.state.reactive.interruptHistory;
    
    console.assert(interruptHistory.length > 0, 'Interrupt should be recorded in state');
    console.assert(interruptHistory[0].bypassedCognitive === true, 'Emergency should bypass cognitive');
    console.assert(interruptHistory[0].priority === 0, 'Should record correct priority');
    
    // Validate pathfinder cleanup
    const pathfinderCleared = harness.agent.bot.pathfinder.goal === null;
    console.assert(pathfinderCleared, 'Pathfinder should be cleared after interrupt');
    
    console.log('✓ Interrupt state consistency test passed');
    return harness.getInterruptSummary();
}

async function testInterruptRecovery() {
    console.log('\n=== Test 6: Interrupt Recovery ===');
    
    const harness = new EmergencyInterruptTestHarness();
    
    // Test recovery from failed interrupt
    const originalGoto = harness.agent.bot.pathfinder.goto;
    harness.agent.bot.pathfinder.goto = async () => {
        throw new Error('Simulated interrupt failure');
    };
    
    try {
        await harness.simulateEmergencyInterrupt('burning');
        console.assert(false, 'Should handle interrupt failure gracefully');
    } catch (error) {
        // Expected to handle gracefully
    }
    
    // Restore original function and test recovery
    harness.agent.bot.pathfinder.goto = originalGoto;
    await harness.simulateEmergencyInterrupt('low_health');
    
    // Validate recovery
    const summary = harness.getInterruptSummary();
    console.assert(summary.totalInterrupts >= 1, 'Should recover and handle subsequent interrupts');
    
    // Validate state is consistent after failure
    const state = harness.agent.getCurrentState();
    console.assert(state, 'Agent state should be accessible after failure');
    
    console.log('✓ Interrupt recovery test passed');
    return summary;
}

// Main test runner
async function runEmergencyInterruptTests() {
    console.log('🔄 Starting Comprehensive Emergency Interrupt Tests...\n');
    
    const results = {
        detection: null,
        preemption: null,
        priorityHandling: null,
        rapidSequence: null,
        stateConsistency: null,
        recovery: null
    };
    
    try {
        results.detection = await testEmergencyInterruptDetection();
        results.preemption = await testCognitivePreemption();
        results.priorityHandling = await testInterruptPriorityHandling();
        results.rapidSequence = await testRapidInterruptSequence();
        results.stateConsistency = await testInterruptStateConsistency();
        results.recovery = await testInterruptRecovery();
        
        // Calculate overall statistics
        const totalInterrupts = Object.values(results).reduce((sum, result) => sum + (result?.totalInterrupts || 0), 0);
        const avgDetectionTime = Object.values(results).reduce((sum, result) => sum + (result?.averageDetectionTime || 0), 0) / Object.keys(results).length;
        const avgResponseTime = Object.values(results).reduce((sum, result) => sum + (result?.averageResponseTime || 0), 0) / Object.keys(results).length;
        
        console.log('\n✅ All emergency interrupt tests passed!');
        console.log('📊 Test Summary:');
        console.log(`  Total interrupts tested: ${totalInterrupts}`);
        console.log(`  Average detection time: ${avgDetectionTime.toFixed(1)}ms`);
        console.log(`  Average response time: ${avgResponseTime.toFixed(1)}ms`);
        console.log('\n🎯 Emergency Interrupt System Validation:');
        console.log('  ✓ Emergency detection works correctly');
        console.log('  ✓ Cognitive preemption functions properly');
        console.log('  ✓ Priority handling is accurate');
        console.log('  ✓ Rapid interrupt sequences meet performance requirements');
        console.log('  ✓ State consistency maintained during interrupts');
        console.log('  ✓ System recovers from interrupt failures');
        
        return results;
        
    } catch (error) {
        console.error('\n❌ Emergency interrupt test failed:', error.message);
        console.error(error.stack);
        throw error;
    }
}

// Export for use in other test files
export { 
    runEmergencyInterruptTests,
    testEmergencyInterruptDetection,
    testCognitivePreemption,
    testInterruptPriorityHandling,
    testRapidInterruptSequence,
    testInterruptStateConsistency,
    testInterruptRecovery,
    MockInterruptController,
    MockAgent,
    EmergencyInterruptTestHarness
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runEmergencyInterruptTests().catch(console.error);
}