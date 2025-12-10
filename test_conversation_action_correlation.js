/**
 * Conversation-Action Correlation Test Suite
 * 
 * Specialized tests to validate that agents can properly correlate
 * their conversations with their current actions and goals
 */

import { LangGraphAgent } from './src/agent/langgraph/agent.js';

// Test configuration for conversation-action correlation
const CORRELATION_TEST_CONFIG = {
    // Required context elements in agent responses
    REQUIRED_CONTEXT_ELEMENTS: {
        currentGoal: ['goal', 'working on', 'trying to', 'objective', 'mission'],
        currentAction: ['doing', 'action', 'activity', 'task', 'currently'],
        actionProgress: ['progress', '%', 'complete', 'done', 'finished'],
        recentActions: ['recently', 'just', 'before', 'earlier', 'was']
    },
    
    // Test scenarios for different conversation contexts
    CONVERSATION_SCENARIOS: [
        {
            name: 'Goal inquiry',
            setup: {
                activeGoals: [{ description: 'Build a cobblestone fortress', progress: { percentage: 35 } }],
                currentAction: { type: 'collect_cobblestone', status: 'executing' },
                decisionHistory: []
            },
            messages: ['what are you working on?', 'what\'s your goal?', 'what are you trying to accomplish?'],
            expectedContext: ['goal', 'fortress', 'build']
        },
        {
            name: 'Action inquiry',
            setup: {
                activeGoals: [{ description: 'Build a cobblestone fortress', progress: { percentage: 35 } }],
                currentAction: { type: 'mine_cobblestone', parameters: { target: 100, current: 35 }, status: 'executing' },
                decisionHistory: []
            },
            messages: ['what are you doing?', 'what\'s your current action?', 'what activity are you performing?'],
            expectedContext: ['mining', 'cobblestone', 'collecting', 'doing']
        },
        {
            name: 'Progress inquiry',
            setup: {
                activeGoals: [{ description: 'Build a cobblestone fortress', progress: { percentage: 65 } }],
                currentAction: { type: 'build_wall', parameters: { width: 50, height: 3, progress: 65 }, status: 'executing' },
                decisionHistory: []
            },
            messages: ['how is your progress?', 'are you making progress?', 'what\'s the status?'],
            expectedContext: ['progress', '65', '%', 'complete']
        },
        {
            name: 'Recent actions inquiry',
            setup: {
                activeGoals: [{ description: 'Build a cobblestone fortress', progress: { percentage: 25 } }],
                currentAction: { type: 'place_blocks', status: 'executing' },
                decisionHistory: [
                    { timestamp: Date.now() - 60000, action: 'find_cobblestone', outcome: 'success' },
                    { timestamp: Date.now() - 30000, action: 'start_mining', outcome: 'in_progress' },
                    { timestamp: Date.now() - 15000, action: 'collect_resources', outcome: 'success' }
                ]
            },
            messages: ['what have you been doing?', 'what did you do recently?', 'what were your recent actions?'],
            expectedContext: ['mining', 'collecting', 'finding', 'recently']
        },
        {
            name: 'Complex multi-context inquiry',
            setup: {
                activeGoals: [
                    { description: 'Build a cobblestone fortress', progress: { percentage: 45 } },
                    { description: 'Collect iron ore', progress: { percentage: 20 } }
                ],
                currentAction: { type: 'explore_cave', parameters: { resources: ['iron', 'coal'] }, status: 'executing' },
                decisionHistory: [
                    { timestamp: Date.now() - 120000, action: 'craft_pickaxe', outcome: 'success' },
                    { timestamp: Date.now() - 90000, action: 'find_cave', outcome: 'success' },
                    { timestamp: Date.now() - 60000, action: 'enter_cave', outcome: 'success' }
                ]
            },
            messages: ['can you give me a status update?', 'what\'s your current situation?', 'tell me about your activities'],
            expectedContext: ['fortress', 'iron', 'exploring', 'cave', 'pickaxe']
        }
    ],
    
    // Performance thresholds
    PERFORMANCE_THRESHOLDS: {
        maxResponseTime: 1500, // 1.5 seconds max for contextual responses
        minContextWords: 8, // Minimum words in contextual response
        maxResponseTimeVariation: 500 // Max variation in response times
    }
};

// Test results tracking
const correlationTestResults = {
    contextBuilding: { passed: 0, failed: 0, errors: [] },
    goalReporting: { passed: 0, failed: 0, errors: [] },
    actionReporting: { passed: 0, failed: 0, errors: [] },
    progressReporting: { passed: 0, failed: 0, errors: [] },
    recentActionsReporting: { passed: 0, failed: 0, errors: [] },
    performance: { passed: 0, failed: 0, errors: [] }
};

/**
 * Track test results for conversation-action correlation
 */
function trackCorrelationResult(category, passed, error = null) {
    if (passed) {
        correlationTestResults[category].passed++;
    } else {
        correlationTestResults[category].failed++;
        if (error) {
            correlationTestResults[category].errors.push(error);
        }
    }
}

/**
 * Test action context building
 */
async function testContextBuilding() {
    console.log('\n=== Testing Action Context Building ===');
    
    try {
        const agent = new LangGraphAgent();
        const testProfile = {
            name: 'ContextTestAgent',
            conversing: 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions: $RECENT_ACTIONS. Respond accordingly.',
            purposeCore: {
                personality: { traits: { openness: 0.7, conscientiousness: 0.8 } },
                motivations: ['build', 'explore'],
                values: ['creativity', 'efficiency'],
                ethics: { harmAvoidance: 0.8 }
            }
        };
        
        await agent.start({ profile: testProfile });
        
        // Test 1: Basic context building
        console.log('\n1. Testing basic context building...');
        
        // Set up comprehensive agent state
        agent.agentState.cognitive.goals = {
            activeGoals: [{
                description: 'Build a medieval castle',
                progress: { percentage: 40 }
            }]
        };
        
        agent.agentState.executive.currentAction = {
            type: 'collect_stone',
            parameters: { target: 500, current: 200 },
            status: 'executing',
            startTime: Date.now() - 60000
        };
        
        agent.agentState.executive.decisionHistory = [
            {
                timestamp: Date.now() - 120000,
                action: 'find_quarry',
                outcome: 'success'
            },
            {
                timestamp: Date.now() - 60000,
                action: 'start_mining',
                outcome: 'in_progress'
            }
        ];
        
        const actionContext = agent.buildActionContext(agent.agentState);
        
        // Check if all required elements are present
        const hasGoal = actionContext.toLowerCase().includes('castle') || 
                       actionContext.toLowerCase().includes('build');
        const hasAction = actionContext.toLowerCase().includes('collect') || 
                         actionContext.toLowerCase().includes('stone');
        const hasProgress = actionContext.toLowerCase().includes('40') || 
                           actionContext.toLowerCase().includes('%');
        const hasRecent = actionContext.toLowerCase().includes('quarry') || 
                         actionContext.toLowerCase().includes('mining');
        
        const hasEnoughWords = actionContext.split(/\s+/).length >= CORRELATION_TEST_CONFIG.PERFORMANCE_THRESHOLDS.minContextWords;
        
        const test1Passed = hasGoal && hasAction && hasProgress && hasRecent && hasEnoughWords;
        
        console.log(`  ${test1Passed ? '✅' : '❌'} Context includes goal: ${hasGoal}, action: ${hasAction}, progress: ${hasProgress}, recent: ${hasRecent}`);
        console.log(`  Word count: ${actionContext.split(/\s+/).length}`);
        trackCorrelationResult('contextBuilding', test1Passed);
        
        // Test 2: Empty state handling
        console.log('\n2. Testing empty state handling...');
        
        // Clear agent state
        agent.agentState.cognitive.goals = { activeGoals: [] };
        agent.agentState.executive.currentAction = null;
        agent.agentState.executive.decisionHistory = [];
        
        const emptyContext = agent.buildActionContext(agent.agentState);
        
        const handlesEmptyState = emptyContext.toLowerCase().includes('no active goal') &&
                                 emptyContext.toLowerCase().includes('no current action');
        
        const test2Passed = handlesEmptyState;
        console.log(`  ${test2Passed ? '✅' : '❌'} Handles empty state: ${handlesEmptyState}`);
        trackCorrelationResult('contextBuilding', test2Passed);
        
        // Test 3: Multiple goals handling
        console.log('\n3. Testing multiple goals handling...');
        
        agent.agentState.cognitive.goals = {
            activeGoals: [
                { description: 'Build a medieval castle', progress: { percentage: 40 } },
                { description: 'Collect iron ore', progress: { percentage: 60 } },
                { description: 'Explore nearby cave', progress: { percentage: 20 } }
            ]
        };
        
        const multiGoalContext = agent.buildActionContext(agent.agentState);
        
        const mentionsMultipleGoals = multiGoalContext.toLowerCase().includes('castle') &&
                                     multiGoalContext.toLowerCase().includes('iron') &&
                                     multiGoalContext.toLowerCase().includes('cave');
        
        const test3Passed = mentionsMultipleGoals;
        console.log(`  ${test3Passed ? '✅' : '❌'} Handles multiple goals: ${mentionsMultipleGoals}`);
        trackCorrelationResult('contextBuilding', test3Passed);
        
        console.log('\n✅ Context building tests completed');
        
    } catch (error) {
        console.error('❌ Context building tests failed:', error);
        trackCorrelationResult('contextBuilding', false, error.message);
    }
}

/**
 * Test goal reporting in conversations
 */
async function testGoalReporting() {
    console.log('\n=== Testing Goal Reporting in Conversations ===');
    
    try {
        const agent = new LangGraphAgent();
        const testProfile = {
            name: 'GoalReportingTestAgent',
            conversing: 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions: $RECENT_ACTIONS. Respond accordingly.',
            purposeCore: {
                personality: { traits: { openness: 0.8, conscientiousness: 0.9 } },
                motivations: ['build', 'create'],
                values: ['efficiency', 'quality'],
                ethics: { harmAvoidance: 0.7 }
            }
        };
        
        await agent.start({ profile: testProfile });
        
        // Test various goal inquiry messages
        const goalInquiries = [
            'what are you working on?',
            'what\'s your main goal?',
            'what are you trying to accomplish?',
            'tell me about your objectives'
        ];
        
        let goalResponsesHandled = 0;
        
        for (const inquiry of goalInquiries) {
            console.log(`\nTesting inquiry: "${inquiry}"`);
            
            // Set up a specific goal
            agent.agentState.cognitive.goals = {
                activeGoals: [{
                    description: 'Construct a defensive wall around the settlement',
                    progress: { percentage: 55 }
                }]
            };
            
            agent.agentState.executive.currentAction = {
                type: 'place_stone_blocks',
                status: 'executing'
            };
            
            const startTime = Date.now();
            await agent.handleMessage('test_user', inquiry);
            const responseTime = Date.now() - startTime;
            
            const lastResponse = agent.agentState.executive.lastResponse;
            
            if (lastResponse) {
                const response = lastResponse.response.toLowerCase();
                
                // Check for goal-related keywords
                const mentionsGoal = CORRELATION_TEST_CONFIG.REQUIRED_CONTEXT_ELEMENTS.currentGoal.some(keyword =>
                    response.includes(keyword)
                );
                
                const mentionsSpecificGoal = response.includes('wall') || 
                                           response.includes('defensive') || 
                                           response.includes('settlement');
                
                const timelyResponse = responseTime <= CORRELATION_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxResponseTime;
                
                const testPassed = mentionsGoal && mentionsSpecificGoal && timelyResponse;
                
                console.log(`  ${testPassed ? '✅' : '❌'} Mentions goal: ${mentionsGoal}, specific: ${mentionsSpecificGoal}, time: ${responseTime}ms`);
                
                if (testPassed) {
                    goalResponsesHandled++;
                }
                
                trackCorrelationResult('goalReporting', testPassed);
            } else {
                console.log(`  ❌ No response generated`);
                trackCorrelationResult('goalReporting', false, 'No response generated');
            }
        }
        
        console.log(`\nGoal reporting summary: ${goalResponsesHandled}/${goalInquiries.length} inquiries handled properly`);
        console.log('\n✅ Goal reporting tests completed');
        
    } catch (error) {
        console.error('❌ Goal reporting tests failed:', error);
        trackCorrelationResult('goalReporting', false, error.message);
    }
}

/**
 * Test action reporting in conversations
 */
async function testActionReporting() {
    console.log('\n=== Testing Action Reporting in Conversations ===');
    
    try {
        const agent = new LangGraphAgent();
        const testProfile = {
            name: 'ActionReportingTestAgent',
            conversing: 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions: $RECENT_ACTIONS. Respond accordingly.',
            purposeCore: {
                personality: { traits: { conscientiousness: 0.9, openness: 0.7 } },
                motivations: ['explore', 'gather'],
                values: ['efficiency', 'discovery'],
                ethics: { harmAvoidance: 0.8 }
            }
        };
        
        await agent.start({ profile: testProfile });
        
        // Test various action inquiry messages
        const actionInquiries = [
            'what are you doing right now?',
            'what\'s your current activity?',
            'what action are you performing?',
            'tell me what you\'re currently doing'
        ];
        
        let actionResponsesHandled = 0;
        
        for (const inquiry of actionInquiries) {
            console.log(`\nTesting inquiry: "${inquiry}"`);
            
            // Set up a specific action
            agent.agentState.cognitive.goals = {
                activeGoals: [{
                    description: 'Gather resources for building',
                    progress: { percentage: 30 }
                }]
            };
            
            agent.agentState.executive.currentAction = {
                type: 'explore_cave_system',
                parameters: { depth: 50, resources: ['iron', 'coal', 'diamonds'] },
                status: 'executing'
            };
            
            const startTime = Date.now();
            await agent.handleMessage('test_user', inquiry);
            const responseTime = Date.now() - startTime;
            
            const lastResponse = agent.agentState.executive.lastResponse;
            
            if (lastResponse) {
                const response = lastResponse.response.toLowerCase();
                
                // Check for action-related keywords
                const mentionsAction = CORRELATION_TEST_CONFIG.REQUIRED_CONTEXT_ELEMENTS.currentAction.some(keyword =>
                    response.includes(keyword)
                );
                
                const mentionsSpecificAction = response.includes('exploring') || 
                                             response.includes('cave') || 
                                             response.includes('resources');
                
                const timelyResponse = responseTime <= CORRELATION_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxResponseTime;
                
                const testPassed = mentionsAction && mentionsSpecificAction && timelyResponse;
                
                console.log(`  ${testPassed ? '✅' : '❌'} Mentions action: ${mentionsAction}, specific: ${mentionsSpecificAction}, time: ${responseTime}ms`);
                
                if (testPassed) {
                    actionResponsesHandled++;
                }
                
                trackCorrelationResult('actionReporting', testPassed);
            } else {
                console.log(`  ❌ No response generated`);
                trackCorrelationResult('actionReporting', false, 'No response generated');
            }
        }
        
        console.log(`\nAction reporting summary: ${actionResponsesHandled}/${actionInquiries.length} inquiries handled properly`);
        console.log('\n✅ Action reporting tests completed');
        
    } catch (error) {
        console.error('❌ Action reporting tests failed:', error);
        trackCorrelationResult('actionReporting', false, error.message);
    }
}

/**
 * Test progress reporting in conversations
 */
async function testProgressReporting() {
    console.log('\n=== Testing Progress Reporting in Conversations ===');
    
    try {
        const agent = new LangGraphAgent();
        const testProfile = {
            name: 'ProgressReportingTestAgent',
            conversing: 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions: $RECENT_ACTIONS. Respond accordingly.',
            purposeCore: {
                personality: { traits: { conscientiousness: 0.95, openness: 0.6 } },
                motivations: ['complete', 'achieve'],
                values: ['progress', 'completion'],
                ethics: { harmAvoidance: 0.7 }
            }
        };
        
        await agent.start({ profile: testProfile });
        
        // Test various progress inquiry messages
        const progressInquiries = [
            'how is your progress?',
            'are you making progress?',
            'what\'s your completion status?',
            'tell me about your progress'
        ];
        
        let progressResponsesHandled = 0;
        
        for (const inquiry of progressInquiries) {
            console.log(`\nTesting inquiry: "${inquiry}"`);
            
            // Set up a specific progress scenario
            agent.agentState.cognitive.goals = {
                activeGoals: [{
                    description: 'Build a watchtower',
                    progress: { percentage: 75 }
                }]
            };
            
            agent.agentState.executive.currentAction = {
                type: 'place_tower_blocks',
                parameters: { height: 20, currentHeight: 15 },
                status: 'executing',
                startTime: Date.now() - 120000 // Started 2 minutes ago
            };
            
            const startTime = Date.now();
            await agent.handleMessage('test_user', inquiry);
            const responseTime = Date.now() - startTime;
            
            const lastResponse = agent.agentState.executive.lastResponse;
            
            if (lastResponse) {
                const response = lastResponse.response.toLowerCase();
                
                // Check for progress-related keywords
                const mentionsProgress = CORRELATION_TEST_CONFIG.REQUIRED_CONTEXT_ELEMENTS.actionProgress.some(keyword =>
                    response.includes(keyword)
                );
                
                const mentionsSpecificProgress = response.includes('75') || 
                                               response.includes('%') || 
                                               response.includes('complete') ||
                                               response.includes('15') ||
                                               response.includes('20');
                
                const timelyResponse = responseTime <= CORRELATION_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxResponseTime;
                
                const testPassed = mentionsProgress && mentionsSpecificProgress && timelyResponse;
                
                console.log(`  ${testPassed ? '✅' : '❌'} Mentions progress: ${mentionsProgress}, specific: ${mentionsSpecificProgress}, time: ${responseTime}ms`);
                
                if (testPassed) {
                    progressResponsesHandled++;
                }
                
                trackCorrelationResult('progressReporting', testPassed);
            } else {
                console.log(`  ❌ No response generated`);
                trackCorrelationResult('progressReporting', false, 'No response generated');
            }
        }
        
        console.log(`\nProgress reporting summary: ${progressResponsesHandled}/${progressInquiries.length} inquiries handled properly`);
        console.log('\n✅ Progress reporting tests completed');
        
    } catch (error) {
        console.error('❌ Progress reporting tests failed:', error);
        trackCorrelationResult('progressReporting', false, error.message);
    }
}

/**
 * Test recent actions reporting in conversations
 */
async function testRecentActionsReporting() {
    console.log('\n=== Testing Recent Actions Reporting in Conversations ===');
    
    try {
        const agent = new LangGraphAgent();
        const testProfile = {
            name: 'RecentActionsTestAgent',
            conversing: 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions: $RECENT_ACTIONS. Respond accordingly.',
            purposeCore: {
                personality: { traits: { openness: 0.8, conscientiousness: 0.7 } },
                motivations: ['remember', 'reflect'],
                values: ['learning', 'experience'],
                ethics: { harmAvoidance: 0.8 }
            }
        };
        
        await agent.start({ profile: testProfile });
        
        // Test various recent actions inquiry messages
        const recentActionsInquiries = [
            'what have you been doing?',
            'what did you do recently?',
            'tell me about your recent activities',
            'what were your recent actions?'
        ];
        
        let recentActionsResponsesHandled = 0;
        
        for (const inquiry of recentActionsInquiries) {
            console.log(`\nTesting inquiry: "${inquiry}"`);
            
            // Set up specific recent actions
            agent.agentState.cognitive.goals = {
                activeGoals: [{
                    description: 'Establish a mining operation',
                    progress: { percentage: 40 }
                }]
            };
            
            agent.agentState.executive.currentAction = {
                type: 'setup_mining_equipment',
                status: 'executing'
            };
            
            agent.agentState.executive.decisionHistory = [
                {
                    timestamp: Date.now() - 180000, // 3 minutes ago
                    action: 'locate_cave_entrance',
                    outcome: 'success'
                },
                {
                    timestamp: Date.now() - 120000, // 2 minutes ago
                    action: 'craft_mining_tools',
                    outcome: 'success'
                },
                {
                    timestamp: Date.now() - 60000, // 1 minute ago
                    action: 'enter_cave',
                    outcome: 'success'
                }
            ];
            
            const startTime = Date.now();
            await agent.handleMessage('test_user', inquiry);
            const responseTime = Date.now() - startTime;
            
            const lastResponse = agent.agentState.executive.lastResponse;
            
            if (lastResponse) {
                const response = lastResponse.response.toLowerCase();
                
                // Check for recent actions keywords
                const mentionsRecent = CORRELATION_TEST_CONFIG.REQUIRED_CONTEXT_ELEMENTS.recentActions.some(keyword =>
                    response.includes(keyword)
                );
                
                const mentionsSpecificActions = response.includes('cave') || 
                                             response.includes('crafting') || 
                                             response.includes('tools') ||
                                             response.includes('locating') ||
                                             response.includes('entering');
                
                const timelyResponse = responseTime <= CORRELATION_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxResponseTime;
                
                const testPassed = mentionsRecent && mentionsSpecificActions && timelyResponse;
                
                console.log(`  ${testPassed ? '✅' : '❌'} Mentions recent: ${mentionsRecent}, specific: ${mentionsSpecificActions}, time: ${responseTime}ms`);
                
                if (testPassed) {
                    recentActionsResponsesHandled++;
                }
                
                trackCorrelationResult('recentActionsReporting', testPassed);
            } else {
                console.log(`  ❌ No response generated`);
                trackCorrelationResult('recentActionsReporting', false, 'No response generated');
            }
        }
        
        console.log(`\nRecent actions reporting summary: ${recentActionsResponsesHandled}/${recentActionsInquiries.length} inquiries handled properly`);
        console.log('\n✅ Recent actions reporting tests completed');
        
    } catch (error) {
        console.error('❌ Recent actions reporting tests failed:', error);
        trackCorrelationResult('recentActionsReporting', false, error.message);
    }
}

/**
 * Test performance of conversation-action correlation
 */
async function testCorrelationPerformance() {
    console.log('\n=== Testing Correlation Performance ===');
    
    try {
        const agent = new LangGraphAgent();
        const testProfile = {
            name: 'CorrelationPerfTestAgent',
            conversing: 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions: $RECENT_ACTIONS. Respond accordingly.',
            purposeCore: {
                personality: { traits: { openness: 0.7, conscientiousness: 0.8 } },
                motivations: ['build', 'explore'],
                values: ['efficiency', 'quality'],
                ethics: { harmAvoidance: 0.7 }
            }
        };
        
        await agent.start({ profile: testProfile });
        
        // Set up a complex agent state
        agent.agentState.cognitive.goals = {
            activeGoals: [
                { description: 'Build a medieval castle', progress: { percentage: 45 } },
                { description: 'Collect rare resources', progress: { percentage: 30 } }
            ]
        };
        
        agent.agentState.executive.currentAction = {
            type: 'explore_dungeon',
            parameters: { depth: 75, seeking: ['diamonds', 'gold'] },
            status: 'executing'
        };
        
        agent.agentState.executive.decisionHistory = [
            { timestamp: Date.now() - 300000, action: 'prepare_equipment', outcome: 'success' },
            { timestamp: Date.now() - 240000, action: 'locate_dungeon', outcome: 'success' },
            { timestamp: Date.now() - 180000, action: 'descend_to_level_50', outcome: 'success' },
            { timestamp: Date.now() - 120000, action: 'find_diamond_vein', outcome: 'success' },
            { timestamp: Date.now() - 60000, action: 'begin_mining', outcome: 'in_progress' }
        ];
        
        // Test 1: Response time consistency
        console.log('\n1. Testing response time consistency...');
        
        const responseTimes = [];
        const testMessages = [
            'what are you doing?',
            'how is your progress?',
            'what have you been doing?',
            'what\'s your goal?',
            'give me a status update'
        ];
        
        for (const message of testMessages) {
            const startTime = Date.now();
            await agent.handleMessage('test_user', message);
            const responseTime = Date.now() - startTime;
            responseTimes.push(responseTime);
        }
        
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxResponseTime = Math.max(...responseTimes);
        const minResponseTime = Math.min(...responseTimes);
        const timeVariation = maxResponseTime - minResponseTime;
        
        const test1Passed = avgResponseTime <= CORRELATION_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxResponseTime &&
                           timeVariation <= CORRELATION_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxResponseTimeVariation;
        
        console.log(`  ${test1Passed ? '✅' : '❌'} Avg: ${Math.round(avgResponseTime)}ms, Min: ${minResponseTime}ms, Max: ${maxResponseTime}ms, Variation: ${timeVariation}ms`);
        trackCorrelationResult('performance', test1Passed);
        
        // Test 2: Context building performance
        console.log('\n2. Testing context building performance...');
        
        const contextBuildTimes = [];
        
        for (let i = 0; i < 10; i++) {
            const startTime = Date.now();
            const context = agent.buildActionContext(agent.agentState);
            const buildTime = Date.now() - startTime;
            contextBuildTimes.push(buildTime);
        }
        
        const avgContextBuildTime = contextBuildTimes.reduce((a, b) => a + b, 0) / contextBuildTimes.length;
        
        const test2Passed = avgContextBuildTime < 50; // Should build context very quickly
        
        console.log(`  ${test2Passed ? '✅' : '❌'} Avg context build time: ${Math.round(avgContextBuildTime)}ms`);
        trackCorrelationResult('performance', test2Passed);
        
        // Test 3: Memory usage during correlation
        console.log('\n3. Testing memory usage during correlation...');
        
        const initialMemory = process.memoryUsage();
        
        // Process many contextual conversations
        for (let i = 0; i < 50; i++) {
            await agent.handleMessage('test_user', `context test ${i}: what are you doing?`);
        }
        
        const finalMemory = process.memoryUsage();
        const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
        
        const test3Passed = memoryGrowth < 20 * 1024 * 1024; // Less than 20MB growth
        
        console.log(`  ${test3Passed ? '✅' : '❌'} Memory growth: ${Math.round(memoryGrowth / 1024 / 1024)}MB`);
        trackCorrelationResult('performance', test3Passed);
        
        console.log('\n✅ Correlation performance tests completed');
        
    } catch (error) {
        console.error('❌ Correlation performance tests failed:', error);
        trackCorrelationResult('performance', false, error.message);
    }
}

/**
 * Run all conversation-action correlation tests
 */
async function runCorrelationTests() {
    console.log('🔄 Starting Conversation-Action Correlation Test Suite');
    console.log('====================================================');
    
    const overallStartTime = Date.now();
    
    try {
        // Run all test categories
        await testContextBuilding();
        await testGoalReporting();
        await testActionReporting();
        await testProgressReporting();
        await testRecentActionsReporting();
        await testCorrelationPerformance();
        
        // Calculate results
        const totalPassed = Object.values(correlationTestResults).reduce((sum, category) => sum + category.passed, 0);
        const totalFailed = Object.values(correlationTestResults).reduce((sum, category) => sum + category.failed, 0);
        const totalTests = totalPassed + totalFailed;
        const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
        
        const overallTime = Date.now() - overallStartTime;
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 CONVERSATION-ACTION CORRELATION TEST RESULTS');
        console.log('='.repeat(60));
        
        console.log('\n📈 Category Results:');
        console.log(`  Context Building:      ${correlationTestResults.contextBuilding.passed}/${correlationTestResults.contextBuilding.passed + correlationTestResults.contextBuilding.failed} passed`);
        console.log(`  Goal Reporting:        ${correlationTestResults.goalReporting.passed}/${correlationTestResults.goalReporting.passed + correlationTestResults.goalReporting.failed} passed`);
        console.log(`  Action Reporting:       ${correlationTestResults.actionReporting.passed}/${correlationTestResults.actionReporting.passed + correlationTestResults.actionReporting.failed} passed`);
        console.log(`  Progress Reporting:     ${correlationTestResults.progressReporting.passed}/${correlationTestResults.progressReporting.passed + correlationTestResults.progressReporting.failed} passed`);
        console.log(`  Recent Actions:         ${correlationTestResults.recentActionsReporting.passed}/${correlationTestResults.recentActionsReporting.passed + correlationTestResults.recentActionsReporting.failed} passed`);
        console.log(`  Performance:            ${correlationTestResults.performance.passed}/${correlationTestResults.performance.passed + correlationTestResults.performance.failed} passed`);
        
        console.log('\n🎯 Overall Results:');
        console.log(`  Total Tests:           ${totalTests}`);
        console.log(`  Passed:                ${totalPassed}`);
        console.log(`  Failed:                ${totalFailed}`);
        console.log(`  Success Rate:           ${successRate.toFixed(1)}%`);
        console.log(`  Execution Time:        ${Math.round(overallTime / 1000)}s`);
        
        // Print any errors
        const allErrors = Object.values(correlationTestResults).flatMap(category => category.errors);
        if (allErrors.length > 0) {
            console.log('\n❌ Errors Encountered:');
            allErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        // Final validation
        console.log('\n' + '='.repeat(60));
        if (successRate >= 95) {
            console.log('🎉 EXCELLENT: Conversation-action correlation is working perfectly!');
            console.log('   Agents can properly contextualize their responses with current activities.');
        } else if (successRate >= 85) {
            console.log('✅ GOOD: Conversation-action correlation is working well.');
            console.log('   Most contextual responses are working with minor issues.');
        } else if (successRate >= 70) {
            console.log('⚠️  ACCEPTABLE: Partial conversation-action correlation.');
            console.log('   Some contextual responses work but additional improvements needed.');
        } else {
            console.log('❌ NEEDS WORK: Conversation-action correlation is not working properly.');
            console.log('   Significant additional work is required.');
        }
        
        console.log('\n🔍 Key Validations:');
        console.log(`  ✅ Context Building: ${correlationTestResults.contextBuilding.failed === 0 ? 'WORKING' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ Goal Reporting: ${correlationTestResults.goalReporting.failed === 0 ? 'WORKING' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ Action Reporting: ${correlationTestResults.actionReporting.failed === 0 ? 'WORKING' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ Progress Reporting: ${correlationTestResults.progressReporting.failed === 0 ? 'WORKING' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ Recent Actions: ${correlationTestResults.recentActionsReporting.failed === 0 ? 'WORKING' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ Performance: ${correlationTestResults.performance.failed === 0 ? 'OPTIMAL' : 'NEEDS OPTIMIZATION'}`);
        
        console.log('\n' + '='.repeat(60));
        
        return {
            success: successRate >= 85,
            totalTests,
            totalPassed,
            totalFailed,
            successRate,
            executionTime: overallTime,
            categoryResults: correlationTestResults
        };
        
    } catch (error) {
        console.error('❌ Conversation-action correlation test suite failed:', error);
        return {
            success: false,
            error: error.message,
            executionTime: Date.now() - overallStartTime
        };
    }
}

// Export for use in other test files
export {
    runCorrelationTests,
    testContextBuilding,
    testGoalReporting,
    testActionReporting,
    testProgressReporting,
    testRecentActionsReporting,
    testCorrelationPerformance,
    CORRELATION_TEST_CONFIG,
    correlationTestResults
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runCorrelationTests().then(results => {
        process.exit(results.success ? 0 : 1);
    }).catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}